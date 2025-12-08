require('dotenv').config();
const fs = require('fs');
const mysql = require('mysql2/promise');

function readMockProducts() {
    const file = fs.readFileSync('mockProducts.json', 'utf8');
    const data = JSON.parse(file);
    if (!Array.isArray(data)) {
        throw new Error('mockProducts.json must contain an array');
    }
    return data;
}

async function seed() {
    const mockProducts = readMockProducts();
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS,
        database: process.env.DB_NAME || 'primenest'
    });

    const [existingCols] = await connection.query("SHOW COLUMNS FROM products LIKE 'use_cases'");
    if (!existingCols.length) {
        await connection.execute("ALTER TABLE products ADD COLUMN use_cases TEXT");
    }

    const query = `
        INSERT INTO products
        (product_ID, name, material, description, stock, price, height_in, width_in, length_in, category, weight_oz, use_cases, color)
        VALUES (?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)
        ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            description = VALUES(description),
            stock = VALUES(stock),
            price = VALUES(price),
            height_in = VALUES(height_in),
            width_in = VALUES(width_in),
            length_in = VALUES(length_in),
            category = VALUES(category),
            weight_oz = VALUES(weight_oz),
            use_cases = VALUES(use_cases)
    `;

    let inserted = 0;
    for (const product of mockProducts) {
        const description = (product.long_description || product.description || '').slice(0, 2000);
        const price = Number(product.discounted_price ?? product.price ?? 0) || 0;
        const stock = product.stock ?? 50;
        const dims = {
            height_in: product.height_in ?? 2,
            width_in: product.width_in ?? 8,
            length_in: product.length_in ?? 10,
            weight_oz: product.weight_oz ?? 10
        };
        const useCases = Array.isArray(product.use_cases)
            ? product.use_cases.join(',')
            : String(product.use_cases || '');
        await connection.execute(query, [
            product.product_ID,
            product.name || 'Unnamed Product',
            description,
            stock,
            price,
            dims.height_in,
            dims.width_in,
            dims.length_in,
            product.category || 'general',
            dims.weight_oz,
            useCases
        ]);
        inserted++;
    }

    await connection.end();
    console.log(`Seeded ${inserted} mock products into the database.`);
}

seed().catch(err => {
    console.error('Seeding mock products failed:', err.message);
    process.exitCode = 1;
});
