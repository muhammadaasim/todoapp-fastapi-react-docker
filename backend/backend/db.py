from contextlib import asynccontextmanager
from typing import AsyncGenerator
from fastapi import FastAPI
from sqlmodel import Session, create_engine, SQLModel
from backend import dbconfig as dbConfig

print(dbConfig.DATABASE_URL)
connection_string = str(dbConfig.DATABASE_URL).replace(
    "postgresql", "postgresql+psycopg"
)

engine = create_engine(
    connection_string, connect_args={}, pool_recycle=300
)


def create_db_and_tables() -> None:
    SQLModel.metadata.create_all(engine)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    print("Creating tables..")
    create_db_and_tables()
    yield


def get_session():
    with Session(engine) as session:
        yield session
