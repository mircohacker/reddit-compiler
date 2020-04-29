import uvicorn

from main import app

app

if __name__ == '__main__':
    uvicorn.run("main:app", reload=True, host="0.0.0.0")
