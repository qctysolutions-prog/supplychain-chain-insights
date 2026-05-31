#!/usr/bin/env node
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { newsArticles } from '../drizzle/schema.ts';

const connection = await mysql.createConnection({
  uri: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: true }
});
const db = drizzle(connection);
const articles = await db.select().from(newsArticles);
console.log('Total articles:', articles.length);
const cats = {};
articles.forEach(a => { cats[a.category] = (cats[a.category] || 0) + 1; });
console.log('By category:', JSON.stringify(cats, null, 2));
articles.forEach(a => console.log(a.date, '|', a.category.substring(0,30), '|', a.title.substring(0,50)));
await connection.end();
