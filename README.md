# NEM2 wallet
> This is NEM2(Catapult) Wallet.

<a href="https://imgur.com/YmbDXIb"><img src="https://i.imgur.com/YmbDXIb.png" width="50%" height="50%" /></a>

# Application

[https://hukusuke1007.github.io/nem2-wallet/](https://hukusuke1007.github.io/nem2-wallet/)

<a href="https://imgur.com/sPzK063"><img src="https://i.imgur.com/sPzK063.png" width="50%" height="50%" /></a>

## Usage for application user
T.B.D

## Usage for developer

Clone project.

```sh
git clone https://github.com/hukusuke1007/nem2-wallet.git
cd nem2-wallet
```

Rename dotenvsample file to .env file.

```sh
mv dotenvsample .env
```

Set the following catapult network in .env file.

- NETWORK
- NODE_HOST
- NODE_PORT
- NETWORK_GENERATION_HASH
- FAUCET_URL
- EXPLORER_URL

Run commands.

```sh
# Install libraries
$ yarn install

# Run localhost
$ yarn serve
```

## Reference
[https://nemtech.github.io/ja/index.html](https://nemtech.github.io/ja/index.html)