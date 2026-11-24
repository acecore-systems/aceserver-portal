import modelConfig from './ai-models.generated.json' with { type: 'json' }

export function selectedSkinDesignModel(): string | null {
  const selection = modelConfig.features?.['skin.design']
  return modelConfig.schema_version === 1 &&
    selection?.profile === 'text.default' &&
    selection.provider === 'meta' &&
    selection.execution_mode === 'realtime' &&
    typeof selection.api_model_id === 'string' &&
    /^[a-z0-9][a-z0-9._-]*$/u.test(selection.api_model_id)
    ? selection.api_model_id
    : null
}

export function isMetaSkinDesignModel(model: unknown): model is string {
  // Existing installations can explicitly pin the supported pre-policy model.
  return (
    typeof model === 'string' &&
    (model === selectedSkinDesignModel() || model === 'muse-ember-1.0')
  )
}
