import pytest
from unittest.mock import AsyncMock, patch, MagicMock
import httpx

from services.ai.ollama_client import ask_ollama, call_gemini_api, _is_cloud_deployment


@pytest.mark.asyncio
async def test_call_gemini_api_success():
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "candidates": [
            {
                "content": {
                    "parts": [
                        {"text": "Suggested median imputation based on skewness."}
                    ]
                },
                "finishReason": "STOP"
            }
        ]
    }

    with patch("services.ai.ollama_client.GEMINI_API_KEY", "test-api-key"), \
         patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_post.return_value = mock_response
        result = await call_gemini_api("Explain imputation")

        assert result == "Suggested median imputation based on skewness."
        assert mock_post.called
        # Check that header auth was used
        call_kwargs = mock_post.call_args[1]
        assert call_kwargs["headers"]["x-goog-api-key"] == "test-api-key"
        assert "gemini-2.0-flash" in mock_post.call_args[0][0]


@pytest.mark.asyncio
async def test_call_gemini_api_model_fallback():
    mock_404 = MagicMock()
    mock_404.status_code = 404
    mock_404.text = "Model not found"

    mock_200 = MagicMock()
    mock_200.status_code = 200
    mock_200.json.return_value = {
        "candidates": [
            {
                "content": {
                    "parts": [{"text": "Fallback model explanation."}]
                }
            }
        ]
    }

    with patch("services.ai.ollama_client.GEMINI_API_KEY", "test-api-key"), \
         patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        # First call fails with 404, second call succeeds
        mock_post.side_effect = [mock_404, mock_200]
        result = await call_gemini_api("Explain outlier")

        assert result == "Fallback model explanation."
        assert mock_post.call_count == 2
        # First call: gemini-2.0-flash, second call: gemini-1.5-flash
        assert "gemini-2.0-flash" in mock_post.call_args_list[0][0][0]
        assert "gemini-1.5-flash" in mock_post.call_args_list[1][0][0]


@pytest.mark.asyncio
async def test_ask_ollama_direct_cloud_routing(monkeypatch):
    monkeypatch.setenv("ENVIRONMENT", "production")
    monkeypatch.setenv("RENDER", "true")

    with patch("services.ai.ollama_client.GEMINI_API_KEY", "test-api-key"), \
         patch("services.ai.ollama_client.call_gemini_api", new_callable=AsyncMock) as mock_gemini:
        mock_gemini.return_value = "Direct cloud explanation."
        result = await ask_ollama("Test prompt")

        assert result == "Direct cloud explanation."
        assert mock_gemini.called


@pytest.mark.asyncio
async def test_ask_ollama_local_failover_to_gemini(monkeypatch):
    monkeypatch.delenv("ENVIRONMENT", raising=False)
    monkeypatch.delenv("RENDER", raising=False)

    with patch("services.ai.ollama_client.GEMINI_API_KEY", "test-api-key"), \
         patch("httpx.AsyncClient.post", side_effect=httpx.ConnectError("Ollama offline")), \
         patch("services.ai.ollama_client.call_gemini_api", new_callable=AsyncMock) as mock_gemini:
        mock_gemini.return_value = "Failover explanation from Gemini."
        result = await ask_ollama("Test prompt")

        assert result == "Failover explanation from Gemini."
        assert mock_gemini.called

