import { useEffect, useState } from "react";
import { useDatasetContext } from "../context/DatasetContext";
import { useAIContext } from "../context/AIContext";

const AIEngine = () => {
  const { datasetData } = useDatasetContext();
  const {
    aiResultsSourcePath,
    setAILoading,
    fetchAIRecommendations
  } = useAIContext();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!datasetData) return;

    if (
      aiResultsSourcePath &&
      aiResultsSourcePath === datasetData.metadata.file_path
    ) {
      return;
    }

    generateInsights();
  }, [datasetData, aiResultsSourcePath]);

  const generateInsights = async () => {
    setLoading(true);
    if (setAILoading) setAILoading(true);

    try {
      await fetchAIRecommendations(
        datasetData.metadata.file_path,
        datasetData.schema,
        datasetData.metadata
      );
    } catch (err) {
      console.error("AI Engine Error:", err);
    } finally {
      setLoading(false);
      if (setAILoading) setAILoading(false);
    }
  };

  return null;
};

export default AIEngine;
