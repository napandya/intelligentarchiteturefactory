FROM python:3.12-slim
WORKDIR /svc
COPY shared /svc/shared
COPY auth /svc/auth
COPY assistant /svc/assistant
COPY files /svc/files
RUN pip install --no-cache-dir -r /svc/auth/requirements.txt --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/
ENV PYTHONPATH=/svc
EXPOSE 8021 8022 8023
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8021"]
