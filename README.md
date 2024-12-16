# Vihaan-Honda

### Getting Started:
1. Clone repo
2. Run `npm install` in both `client` and `api` directories to get all dependencies
3. Create a `.env` file in `api` directory
    - Add `MONGODB_URL` for connecting to MongoDB (eg: `mongodb://localhost:27017/vihaan-honda`) 
    - Add `ACCESS_TOKEN_SECRET` for JWT Token generation
4. Run `npm run dev` in both `client` and `api` directories
5. Open `https://localhost:5173` to run app

<hr>

### Taking/Restoring Backups:
1. Use `mongodump` for taking backup. Eg: `mongodump --db vihaan-honda --collection executives --out mongodb_backup`
2. Use `mongorestore` for restoring backup.
    - For all backed up collections, eg: `mongorestore --db vihaan-honda mongodb_backup/vihaan-honda`
    - For a particular collection:
      - Basic command, eg: `mongorestore --db vihaan-honda --collection executives mongodb_backup/vihaan-honda/executives.bson`
      - Including metadata (drops existing collection and includes metadata .json file with same name as .bson), eg: `mongorestore --db vihaan-honda --collection executives --drop mongodb_backup/vihaan-honda/executives.bson`
