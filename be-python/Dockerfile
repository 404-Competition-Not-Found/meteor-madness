FROM python:3.13.7

# Imposta la variabile d'ambiente
ENV APP_WORKDIR=/app

WORKDIR ${APP_WORKDIR}

COPY ./src ${APP_WORKDIR}

COPY requirements.txt requirements.txt

RUN pip install -r requirements.txt

EXPOSE 8000

CMD ["uvicorn", "main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"]