# IWI bulletinboard backend
## Description

- Publish firebase cloud messages on new entries in iwi bulletinboard
- All information is publicly available from the *Hoschschule Karlsruhe* and faculty *IWI*
- Also see the impresum and privacy information of the owner [here](https://intranet.hka-iwi.de/iwii/info/dataprotection)

## Usage

1. Insert `secret.json` from your firebase messaging account into the directory root
2. Run docker compose: `docker compose up`

## Configuration

Edit the update interval by editing the [docker-compose.yml](./docker-compose.yml) file
