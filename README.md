# Run the docker build command from outside of the project root directory

# Run the following commands to build docker images:


* docker build -f auth-svc/auth-svc.dockerfile -t auth-svc .


# Run the following commands to create and run the docker containers from the above images:

* docker run -p 50052:50052 -d auth-svc


# Other helpful docker commands:

* #Stop all running containers
docker stop $(docker ps -aq)

* #Remove all containers
docker rm $(docker ps -aq)

* #Remove all images
docker rmi $(docker images -q)

* #Remove only dangling/unused images
docker rmi $(docker images --quiet --filter "dangling=true")

* #list docker images
docker images

* #list docker containers
docker ps

* #list only active docker containers
docker ps -a