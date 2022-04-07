.PHONY: run
run:
	docker run -ti --rm -v $(PWD):/usr/share/nginx/html/ -p 8080:80 nginx:alpine
