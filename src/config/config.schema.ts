import * as Joi from 'joi';

export interface ConfigSchema {
  PORT: number;
  IARA_EDGE_URL?: string;
  IARA_SECRET?: string;
  DEFAULT_CLINIC?: string;
  DEFAULT_ORIGEM?: string;
}

export const validationSchema = Joi.object({
  PORT: Joi.number().default(3000),
  IARA_EDGE_URL: Joi.string().uri().optional(),
  IARA_SECRET: Joi.string().optional(),
  DEFAULT_CLINIC: Joi.string().optional(),
  DEFAULT_ORIGEM: Joi.string().optional(),
});

