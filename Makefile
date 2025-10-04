# Docker configuration files
DOCKER_COMPOSE=./docker-compose.yml

# Target directories and files
TARGET=./dist
TIMESTAMP := $(shell date "+%Y-%m-%d_%H-%M-%S")
LOGFILE := ${TARGET}/app-${TIMESTAMP}.log
ERRFILE := ${TARGET}/err-${TIMESTAMP}.log


# ==== PHONY TARGETS ========================================================= #
# Don't treat these targets as files
.PHONY: all up stop prune


# ==== DEV TARGETS ================ #
# Default behaviour: up
all: up

# DEV: run docker-compose dev configuration and keep terminal (nohup ... &).
# Use `make stop` to kill the containers.
# --build forces to rebuild the docker image before deploying.
up: ${TARGET} stop
#nohup docker-compose -f ${DOCKER_COMPOSE_DEV} up --build > ${LOGFILE} 2> ${ERRFILE} &
	docker compose -f ${DOCKER_COMPOSE} up --build

# Stop running containers
stop:
	docker compose -f ${DOCKER_COMPOSE} down

# Prune Docker system
#! WARNING: removes all non-running containers and images
prune:
	docker system prune -a -f


# ==== FILE TARGETS ========================================================== #
# Create target directory if it is missing
${TARGET}:
	mkdir ${TARGET}