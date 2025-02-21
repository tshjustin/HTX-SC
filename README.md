### HTX TC 

#### Starting up 

Upon building the container, `start.sh` is triggered and runs the start up script that builds the `vite` and `express` servers. 

```
cd HTX-SC 

docker build -t htx-app .

docker run -it --name htx-app -p 5176:5173 htx-app

curl http://localhost:5176 # check connection. If valid, then can be accessed already
```

#### Shutting down / Restart 

if container was stopped, restart via: 
```
docker start -i htx-app 
```

`start.sh` contains a trap that kills the servers on `ctrl-c`. 

#### Caution on ports 
In the container, `Express` listens on 3101, `Vite` listens on 5173. 

If the server's 5176 is being in used, modify the mapping <5176:5173> => <51xx:5173>


#### Notes
Any updates to the public/data/ is reflected inside the container and not mounted to q4_volume, so dont delete the 
container before extracting the data out. 