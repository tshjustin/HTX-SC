### HTX TC 

#### Starting up 

Upon building the container, `start.sh` is triggered and runs the start up script that builds the `vite` and `express` servers. 

```
cd HTX-SC 

docker build -t htx-app .

docker run -it --name htx-app -p 5176:5176 -p 3151:3151 htx-app
```

#### Shutting down
`start.sh` contains a trap that kills the servers on `cntrl-c`. 

#### Caution on ports 
- If facing port issues, modify the `Dockerfile` and choose ports that may be free. Modify the docker run <ports:ports> to reflect these changes.

- If the **backend port is changed**, modify the backend port in `vite.config.ts` too. 

- By default, Vite port = `5173`, Express port = `3000`