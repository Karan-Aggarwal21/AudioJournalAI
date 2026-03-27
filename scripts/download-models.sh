#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
MODELS_DIR="${MODELS_DIR:-${PROJECT_ROOT}/../models}"
SHERPA_BASE_DIR="${PROJECT_ROOT}/sherpa-onnx-whisper-base.en"

download_file() {
	local url="$1"
	local out="$2"
	mkdir -p "$(dirname "$out")"

	if command -v wget >/dev/null 2>&1; then
		wget -q -O "$out" "$url"
		return
	fi

	if command -v curl >/dev/null 2>&1; then
		curl -fsSL "$url" -o "$out"
		return
	fi

	echo "Error: wget or curl is required to download model files." >&2
	exit 1
}

echo "Downloading models to: ${MODELS_DIR}"

echo "Preparing Whisper Base (Sherpa) STT files..."
mkdir -p "${MODELS_DIR}"
if [ -f "${SHERPA_BASE_DIR}/base.en-encoder.int8.onnx" ] && [ -f "${SHERPA_BASE_DIR}/base.en-decoder.int8.onnx" ] && [ -f "${SHERPA_BASE_DIR}/base.en-tokens.txt" ]; then
	cp -f "${SHERPA_BASE_DIR}/base.en-encoder.int8.onnx" "${MODELS_DIR}/base.en-encoder.int8.onnx"
	cp -f "${SHERPA_BASE_DIR}/base.en-decoder.int8.onnx" "${MODELS_DIR}/base.en-decoder.int8.onnx"
	cp -f "${SHERPA_BASE_DIR}/base.en-tokens.txt" "${MODELS_DIR}/base.en-tokens.txt"
	echo "Copied Whisper Base Sherpa files to ${MODELS_DIR}"
else
	echo "Warning: Local sherpa-onnx-whisper-base.en files were not found; STT init may fail until these files are added to ${MODELS_DIR}." >&2
fi

echo "Downloading Xenova/bert-base-multilingual-uncased-sentiment..."
download_file "https://huggingface.co/Xenova/bert-base-multilingual-uncased-sentiment/resolve/main/config.json" "${MODELS_DIR}/Xenova/bert-base-multilingual-uncased-sentiment/config.json"
download_file "https://huggingface.co/Xenova/bert-base-multilingual-uncased-sentiment/resolve/main/special_tokens_map.json" "${MODELS_DIR}/Xenova/bert-base-multilingual-uncased-sentiment/special_tokens_map.json"
download_file "https://huggingface.co/Xenova/bert-base-multilingual-uncased-sentiment/resolve/main/tokenizer_config.json" "${MODELS_DIR}/Xenova/bert-base-multilingual-uncased-sentiment/tokenizer_config.json"
download_file "https://huggingface.co/Xenova/bert-base-multilingual-uncased-sentiment/resolve/main/tokenizer.json" "${MODELS_DIR}/Xenova/bert-base-multilingual-uncased-sentiment/tokenizer.json"
download_file "https://huggingface.co/Xenova/bert-base-multilingual-uncased-sentiment/resolve/main/onnx/model_quantized.onnx" "${MODELS_DIR}/Xenova/bert-base-multilingual-uncased-sentiment/onnx/model_quantized.onnx"

echo "Downloading Xenova/xlm-roberta-base..."
download_file "https://huggingface.co/Xenova/xlm-roberta-base/resolve/main/config.json" "${MODELS_DIR}/Xenova/xlm-roberta-base/config.json"
download_file "https://huggingface.co/Xenova/xlm-roberta-base/resolve/main/quantize_config.json" "${MODELS_DIR}/Xenova/xlm-roberta-base/quantize_config.json"
download_file "https://huggingface.co/Xenova/xlm-roberta-base/resolve/main/tokenizer_config.json" "${MODELS_DIR}/Xenova/xlm-roberta-base/tokenizer_config.json"
download_file "https://huggingface.co/Xenova/xlm-roberta-base/resolve/main/tokenizer.json" "${MODELS_DIR}/Xenova/xlm-roberta-base/tokenizer.json"
download_file "https://huggingface.co/Xenova/xlm-roberta-base/resolve/main/onnx/model_quantized.onnx" "${MODELS_DIR}/Xenova/xlm-roberta-base/onnx/model_quantized.onnx"


echo "Downloading Silero VAD..."

download_file "https://huggingface.co/Xenova/silero-vad/resolve/main/onnx/model.onnx" \
"${MODELS_DIR}/silero_vad.onnx"

echo "Verifying models..."

if [ ! -f "${MODELS_DIR}/Xenova/bert-base-multilingual-uncased-sentiment/onnx/model_quantized.onnx" ]; then
  echo "Error: BERT model missing"
  exit 1
fi

echo "Done. Models are available at: ${MODELS_DIR}"

