from typing import Type

from pydantic import BaseModel, Field
from crewai.tools import BaseTool
from langchain_community.tools import DuckDuckGoSearchRun


class WebSearchInput(BaseModel):
    """Input schema for WebSearchTool."""

    query: str = Field(..., description="Search query for DuckDuckGo.")


class WebSearchTool(BaseTool):
    name: str = "web_search"
    description: str = "Search the web using DuckDuckGo for recent or factual context."
    args_schema: Type[BaseModel] = WebSearchInput
    search: DuckDuckGoSearchRun = Field(default_factory=DuckDuckGoSearchRun)

    def _run(self, query: str) -> str:
        try:
            return self.search.run(query)
        except Exception as exc:
            return f"Error searching the web: {exc}"
