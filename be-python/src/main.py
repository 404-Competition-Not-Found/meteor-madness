from fastapi import FastAPI, File, UploadFile
import json

app = FastAPI()

@app.post("/test")
def test():
    return { "test": True }