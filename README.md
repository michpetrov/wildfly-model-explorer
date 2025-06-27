Tool to examine the WildFly resource model, specifically the resource-description. Based on https://github.com/darranl/wildfly-react-getting-started

## Requirements 

### WildFly settings
Pass `enable-auth.cli` to CLI (`jboss-cli.sh -c --file=<dir>/enable-auth.cli`) 
this allows the app to be authenticated and to access management resources

### ENV
Create `.env` file in `src/main/explorer` and fill in the username and password (the same you use for web console)
```
REACT_APP_USERNAME=
REACT_APP_PASSWORD=
```

## Building the app
Build with `mvn clean package` (this will automatically deploy it), then open http://localhost:8080/wildfly-model-explorer/

## Troubleshooting
```
Module not found: Error: Default condition should be last one
```

Open `src/main/explorer/node_modules/digest-fetch/package.json` and look for 
```
"exports": {
  "default": "./digest-fetch-src.js",
  "types": "./digest-fetch-src.d.ts"
},
```
put the `"default"` property to the bottom