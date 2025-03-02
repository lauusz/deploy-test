import { getConnection } from "@/libs/db";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const {
      formList,
      date_at,
      po,
      dn,
      so,
      phone_number,
      license_plate_no,
      customer_id,
      delivery_note,
      company_name,
      address,
      employee_id,
      pic,
    } = req.body;

    if (
      !formList ||
      !date_at ||
      !po ||
      !dn ||
      !so ||
      !phone_number ||
      !license_plate_no ||
      !customer_id ||
      !delivery_note ||
      !company_name ||
      !address ||
      !employee_id ||
      !pic
    ) {
      return res.status(400).json({
        message: "Missing required fields: " + JSON.stringify(req.body),
      });
    }

    const in_out = "OUT-EXT";

    // Mendapatkan koneksi dari pool
    const connection = await getConnection();
    try {
      await connection.beginTransaction();

      // Check if customer exists
      const [checkCustomer] = await connection.query(
        "SELECT customer_id FROM customers_db WHERE customer_id = ?",
        [customer_id]
      );

      if (checkCustomer.length === 0) {
        await connection.query(
          "INSERT INTO customers_db (customer_id, company_name, phone_number, address) VALUES (?, ?, ?, ?)",
          [customer_id, company_name, phone_number, address]
        );
      }

      // Insert ke delivery_note_db hanya sekali
      const [dnResult] = await connection.query(
        "INSERT INTO delivery_note_db (delivery_note_no, delivery_note, po, so_no, license_plate_no, customer_id, delivery_date, employee_id, attn_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [dn, delivery_note, po, so, license_plate_no, customer_id, date_at, employee_id, pic]
      );

      const deliveryNoteId = dnResult.insertId;

      for (const form of formList) {
        // Insert ke inventories_db
        const [result] = await connection.query(
          "INSERT INTO inventories_db (in_out, dn, date_at, po, qty) VALUES (?, ?, ?, ?, ?)",
          [in_out, dn, date_at, po, form.qty]
        );

        const insertId = result.insertId;

        // Insert ke database_sku
        await connection.query(
          "INSERT INTO database_sku (inventory_db_id, product_id, employees_id) VALUES (?, ?, ?)",
          [insertId, form.product_id, employee_id]
        );

        // Insert ke delivery_note_details
        await connection.query(
          "INSERT INTO delivery_note_details (delivery_note_id, product_id, uom_id, qty) VALUES (?, ?, ?, ?)",
          [deliveryNoteId, form.product_id, form.uom_id, form.qty]
        );
      }

      await connection.commit();
      res.status(200).json({ message: "Data berhasil disimpan!" });
    } catch (error) {
      console.error("Error saat menyimpan data:", error);
      await connection.rollback();
      res.status(500).json({ message: "Terjadi kesalahan saat menyimpan data." });
    } finally {
      connection.release();
    }
  } else {
    res.status(405).end();
  }
}
