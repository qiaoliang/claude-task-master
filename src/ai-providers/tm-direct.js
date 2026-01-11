/**
 * tm-direct.js
 * AI provider implementation for direct TM (Task Master) models.
 * Uses the official Zhipu AI API endpoint directly, not through z.ai routing.
 */

import { OpenAICompatibleProvider } from './openai-compatible.js';
import { generateObject } from 'ai';
import { getAITelemetryConfig, hashProjectRoot } from '../telemetry/sentry.js';
import { log } from '../../scripts/modules/utils.js';

/**
 * TM Direct provider supporting TM models through Zhipu AI's official API.
 */
export class TMDirectProvider extends OpenAICompatibleProvider {
	constructor() {
		super({
			name: 'TM-Direct',
			apiKeyEnvVar: 'TM_API_KEY',
			requiresApiKey: true,
			defaultBaseURL: 'https://open.bigmodel.cn/api/paas/v4',
			supportsStructuredOutputs: true
		});
	}

	/**
	 * Override getBaseURL to use TM_BASE_URL environment variable
	 * @param {object} params - Client parameters
	 * @returns {string|undefined} The base URL to use
	 */
	getBaseURL(params) {
		// Check for TM_BASE_URL environment variable first
		if (params.baseURL) {
			return params.baseURL;
		}

		// Try to get from environment
		const envBaseURL = process.env.TM_BASE_URL;
		if (envBaseURL) {
			return envBaseURL;
		}

		// Fall back to default
		return this.defaultBaseURL;
	}

	/**
	 * Override getClient to inject TM_MODEL from environment if not specified
	 * @param {object} params - Parameters for client initialization
	 * @returns {Function} OpenAI-compatible client function
	 */
	getClient(params) {
		// If modelId is not provided, use TM_MODEL environment variable
		if (!params.modelId && process.env.TM_MODEL) {
			params.modelId = process.env.TM_MODEL;
		}

		// Call parent method with updated params
		return super.getClient(params);
	}

	/**
	 * Override token parameter preparation for TM
	 * TM API doesn't support max_tokens parameter
	 * @returns {object} Empty object for TM (doesn't support maxOutputTokens)
	 */
	prepareTokenParam() {
		// TM API rejects max_tokens parameter
		return {};
	}

	/**
	 * Introspects a Zod schema to find the property that expects an array
	 * @param {import('zod').ZodType} schema - The Zod schema to introspect
	 * @returns {string|null} The property name that expects an array, or null if not found
	 */
	findArrayPropertyInSchema(schema) {
		try {
			// Get the def object from Zod v4 API
			const def = schema._zod.def;

			// Check if schema is a ZodObject
			const isObject = def?.type === 'object' || def?.typeName === 'ZodObject';

			if (!isObject) {
				return null;
			}

			// Get the shape - it can be a function, property, or getter
			let shape = def.shape;
			if (typeof shape === 'function') {
				shape = shape();
			}

			if (!shape || typeof shape !== 'object') {
				return null;
			}

			// Find the first property that is an array
			for (const [key, value] of Object.entries(shape)) {
				// Get the def object for the property using Zod v4 API
				const valueDef = value._zod.def;

				// Check if the property is a ZodArray
				const isArray =
					valueDef?.type === 'array' || valueDef?.typeName === 'ZodArray';

				if (isArray) {
					return key;
				}
			}

			return null;
		} catch (error) {
			// If introspection fails, log and return null
			console.warn('Failed to introspect Zod schema:', error.message);
			return null;
		}
	}

	/**
	 * Override generateObject to use JSON mode instead of auto mode
	 * This avoids the responseFormat parameter which is not supported by GLM-4.7
	 * @param {object} params - Parameters for object generation
	 * @returns {Promise<object>} Normalized response
	 */
	async generateObject(params) {
		try {
			this.validateParams(params);
			this.validateMessages(params.messages);

			if (!params.schema) {
				throw new Error('Schema is required for object generation');
			}
			if (!params.objectName) {
				throw new Error('Object name is required for object generation');
			}

			log(
				'debug',
				`Generating ${this.name} object ('${params.objectName}') with model: ${params.modelId}`
			);

			const client = await this.getClient(params);

			// Get Sentry telemetry config with function ID and metadata for better tracing
			// Format: provider.model.command.method.objectName
			const commandName = params.commandName || 'unknown';
			const functionId = `${this.name}.${params.modelId}.${commandName}.generateObject.${params.objectName}`;

			// Build telemetry metadata for enhanced filtering/grouping in Sentry
			const metadata = {
				command: commandName,
				outputType: params.outputType,
				tag: params.tag,
				projectHash: params.projectRoot,
				userId: params.userId, // Hamster user ID if authenticated
				briefId: params.briefId // Hamster brief ID if connected
			};

			const telemetryConfig = getAITelemetryConfig(functionId, metadata);

			const result = await generateObject({
				model: client(params.modelId),
				messages: params.messages,
				schema: params.schema,
				mode: 'json', // Force JSON mode to avoid responseFormat parameter
				schemaName: params.objectName,
				schemaDescription: `Generate a valid JSON object for ${params.objectName}`,
				maxTokens: params.maxTokens,
				...(this.supportsTemperature && params.temperature !== undefined
					? { temperature: params.temperature }
					: {}),
				...(telemetryConfig && { experimental_telemetry: telemetryConfig })
			});

			log(
				'debug',
				`${this.name} generateObject completed successfully for model: ${params.modelId}`
			);

			const inputTokens =
				result.usage?.inputTokens ?? result.usage?.promptTokens ?? 0;
			const outputTokens =
				result.usage?.outputTokens ?? result.usage?.completionTokens ?? 0;
			const totalTokens =
				result.usage?.totalTokens ?? inputTokens + outputTokens;

			let finalObject = result.object;

			// If result.object is an array, wrap it based on schema introspection
			if (Array.isArray(finalObject)) {
				// Try to find the array property from the schema
				const wrapperKey = this.findArrayPropertyInSchema(params.schema);

				if (wrapperKey) {
					finalObject = {
						[wrapperKey]: finalObject
					};
				} else {
					// Fallback: if we can't introspect the schema, use the object name
					// This handles edge cases where schema introspection might fail
					console.warn(
						`TM returned a bare array for '${params.objectName}' but could not determine wrapper property from schema. Using objectName as fallback.`
					);

					finalObject = {
						[params.objectName]: finalObject
					};
				}
			}

			return {
				object: finalObject,
				usage: {
					inputTokens,
					outputTokens,
					totalTokens
				}
			};
		} catch (error) {
			this.handleError('object generation', error);
		}
	}
}