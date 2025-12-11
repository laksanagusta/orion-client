# Docker Hub Configuration
# Ganti dengan username Docker Hub kamu
DOCKER_USERNAME ?= laksanadika
IMAGE_NAME ?= orion-client
IMAGE_TAG ?= latest

# API Configuration
VITE_API_URL ?= https://apiorion.marvcore.com
VITE_IDENTITY_URL ?= https://identity.marvcore.com

# Full image name
FULL_IMAGE_NAME = $(DOCKER_USERNAME)/$(IMAGE_NAME):$(IMAGE_TAG)

# ===========================================
# Docker Commands
# ===========================================

## Build Docker image
.PHONY: docker-build
docker-build:
	@echo "🔨 Building Docker image..."
	@echo "   API URL: $(VITE_API_URL)"
	@echo "   Identity URL: $(VITE_IDENTITY_URL)"
	docker build --no-cache --platform linux/amd64 \
		--build-arg VITE_API_URL=$(VITE_API_URL) \
		--build-arg VITE_IDENTITY_URL=$(VITE_IDENTITY_URL) \
		-t $(FULL_IMAGE_NAME) .
	@echo "✅ Image built: $(FULL_IMAGE_NAME)"

## Push Docker image to Docker Hub
.PHONY: docker-push
docker-push:
	@echo "🚀 Pushing image to Docker Hub..."
	docker push $(FULL_IMAGE_NAME)
	@echo "✅ Image pushed: $(FULL_IMAGE_NAME)"

## Build and push Docker image to Docker Hub
.PHONY: docker-deploy
docker-deploy: docker-build docker-push
	@echo "🎉 Deployment complete!"
	@echo ""
	@echo "📋 To pull and run on your cloud server:"
	@echo "   docker pull $(FULL_IMAGE_NAME)"
	@echo "   docker run -d -p 80:80 --name orion-client $(FULL_IMAGE_NAME)"

## Tag and push with specific version
.PHONY: docker-release
docker-release:
	@if [ -z "$(VERSION)" ]; then \
		echo "❌ Please specify VERSION, e.g., make docker-release VERSION=1.0.0"; \
		exit 1; \
	fi
	@echo "🔨 Building and tagging version $(VERSION)..."
	@echo "   API URL: $(VITE_API_URL)"
	@echo "   Identity URL: $(VITE_IDENTITY_URL)"
	docker build --no-cache --platform linux/amd64 \
		--build-arg VITE_API_URL=$(VITE_API_URL) \
		--build-arg VITE_IDENTITY_URL=$(VITE_IDENTITY_URL) \
		-t $(DOCKER_USERNAME)/$(IMAGE_NAME):$(VERSION) .
	docker build --no-cache --platform linux/amd64 \
		--build-arg VITE_API_URL=$(VITE_API_URL) \
		--build-arg VITE_IDENTITY_URL=$(VITE_IDENTITY_URL) \
		-t $(DOCKER_USERNAME)/$(IMAGE_NAME):latest .
	@echo "🚀 Pushing images..."
	docker push $(DOCKER_USERNAME)/$(IMAGE_NAME):$(VERSION)
	docker push $(DOCKER_USERNAME)/$(IMAGE_NAME):latest
	@echo "✅ Released version $(VERSION)"

## Login to Docker Hub
.PHONY: docker-login
docker-login:
	@echo "🔐 Logging in to Docker Hub..."
	docker login

## Run Docker container locally
.PHONY: docker-run
docker-run:
	@echo "🏃 Running container locally on port 3000..."
	docker run -d -p 3000:80 --name $(IMAGE_NAME) $(FULL_IMAGE_NAME)
	@echo "✅ Container running at http://localhost:3000"

## Stop and remove local container
.PHONY: docker-stop
docker-stop:
	@echo "🛑 Stopping container..."
	-docker stop $(IMAGE_NAME)
	-docker rm $(IMAGE_NAME)
	@echo "✅ Container stopped and removed"

## Remove Docker image
.PHONY: docker-clean
docker-clean:
	@echo "🧹 Removing Docker image..."
	-docker rmi $(FULL_IMAGE_NAME)
	@echo "✅ Image removed"

## Show Docker images
.PHONY: docker-images
docker-images:
	docker images | grep $(IMAGE_NAME)

# ===========================================
# Development Commands
# ===========================================

## Install dependencies
.PHONY: install
install:
	npm ci

## Run development server
.PHONY: dev
dev:
	npm run dev

## Build for production
.PHONY: build
build:
	npm run build

## Run linting
.PHONY: lint
lint:
	npm run lint

# ===========================================
# Help
# ===========================================

.PHONY: help
help:
	@echo "📖 Available commands:"
	@echo ""
	@echo "Docker Commands:"
	@echo "  make docker-login    - Login to Docker Hub"
	@echo "  make docker-build    - Build Docker image"
	@echo "  make docker-push     - Push image to Docker Hub"
	@echo "  make docker-deploy   - Build and push image (recommended)"
	@echo "  make docker-release VERSION=x.x.x - Tag and push specific version"
	@echo "  make docker-run      - Run container locally on port 3000"
	@echo "  make docker-stop     - Stop local container"
	@echo "  make docker-clean    - Remove Docker image"
	@echo "  make docker-images   - List Docker images"
	@echo ""
	@echo "Development Commands:"
	@echo "  make install         - Install dependencies"
	@echo "  make dev             - Run development server"
	@echo "  make build           - Build for production"
	@echo "  make lint            - Run linting"
	@echo ""
	@echo "Configuration:"
	@echo "  DOCKER_USERNAME      - Docker Hub username (default: laksanadika)"
	@echo "  IMAGE_NAME           - Docker image name (default: orion-client)"
	@echo "  IMAGE_TAG            - Docker image tag (default: latest)"
	@echo "  VITE_API_URL         - API Base URL (e.g., https://apiorion.marvcore.com)"
	@echo "  VITE_IDENTITY_URL    - Identity API URL (e.g., https://apiorion.marvcore.com)"
	@echo ""
	@echo "Example:"
	@echo "  make docker-deploy VITE_API_URL=https://apiorion.marvcore.com VITE_IDENTITY_URL=https://apiorion.marvcore.com"

.DEFAULT_GOAL := help
