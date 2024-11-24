from fastapi import Depends
from sqlmodel import Session, select
from backend.models import Todo
from datetime import datetime
from backend.db import get_session
from typing import Optional, Annotated


def create_todo_entry(session: Annotated[Session, Depends(get_session)], todo: Todo) -> Todo:
    print(todo)
    session.add(todo)
    session.commit()
    session.refresh(todo)
    print('Successfully inserted')
    return todo


def update_todo_entry(session: Annotated[Session, Depends(get_session)], todo_id: int, updated_data: dict) -> Optional[Todo]:
    todo = session.get(Todo, todo_id)
    if todo:
        for key, value in updated_data.items():
            setattr(todo, key, value)
        todo.updated_at = datetime.utcnow()
        session.add(todo)
        session.commit()
        session.refresh(todo)
    return todo


def get_all_todos(session: Annotated[Session, Depends(get_session)]) -> list[Todo]:
    todos = session.exec(select(Todo).order_by(Todo.position)).all()  # Order by position for drag-and-drop functionality
    return todos
