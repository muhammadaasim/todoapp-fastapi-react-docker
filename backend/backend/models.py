from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel


class Todo(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(index=True, description="Title of the todo task")
    content: str = Field(description="Details or content of the todo task")
    status: str = Field(default="pending", description="Status of the task, e.g., pending, in-progress, completed")
    position: int = Field(default=0, description="Position of the task in the list, used for drag and drop")
    createdAt: Optional[str] = Field(default=None, description="Creation timestamp")
    updatedAt: Optional[str] = Field(default=None, description="Update timestamp")

    def update_position(self, new_position: int) -> None:
        """Update the position of the task."""
        self.position = new_position

    def update_status(self, new_status: str) -> None:
        """Update the status of the task."""
        self.status = new_status
        self.updatedAt = datetime.utcnow()
