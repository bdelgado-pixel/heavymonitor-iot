import {Pool} from 'pg';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {migrate} from './schema';
export async function initializeDatabase(pool:Pool){const sql=await readFile(resolve(__dirname,'../../../database/001_initial.sql'),'utf8');const db=await pool.connect();try{await db.query('BEGIN');await db.query('SELECT pg_advisory_xact_lock(78210411)');await db.query(sql);await db.query('COMMIT')}catch(e){await db.query('ROLLBACK');throw e}finally{db.release()}await migrate(pool)}
