.PHONY: run
run:
	#sudo docker run -ti --rm --cpus=1 -e NGINX_ENTRYPOINT_WORKER_PROCESSES_AUTOTUNE=-1 -v $(PWD):/usr/share/nginx/html/ -p 8080:80 nginx:alpine
	sudo docker run -ti --rm --cpus=1 --cpuset-cpus=1 -v $(PWD):/usr/share/nginx/html/ -p 8080:80 nginx:alpine
