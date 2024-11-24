from fastapi import APIRouter, Depends, HTTPException
from typing import Annotated, Optional
from backend.models import Todo
from backend.db import get_session
from backend.services import create_todo_entry, get_all_todos, update_todo_entry
from sqlmodel import Session

router = APIRouter()

@router.post("/", response_model=Todo)
def create_todo(
    todo: Todo, session: Annotated[Session, Depends(get_session)]
) -> Todo:
    return create_todo_entry(session, todo)

@router.get("/", response_model=list[Todo])
def read_todos(
    session: Annotated[Session, Depends(get_session)]
) -> list[Todo]:
    return get_all_todos(session)

@router.put("/{todo_id}", response_model=Todo)
def update_todo(
    todo_id: int,
    updated_data: dict,
    session: Annotated[Session, Depends(get_session)]
) -> Todo:
    todo = update_todo_entry(session, todo_id, updated_data)
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    return todo
