/********************************************************************************
 * BTI425 – Assignment 1
 * I declare that this assignment is my own work in accordance with Seneca's
 * Academic Integrity Policy:
 * https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
 * Name: Nand K Patel
 * Student ID: 166939215
 * Date: 2024/01/12
 * Published URL: https://difficult-cod-mittens.cyclic.app/
 ********************************************************************************/
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const ListingsDB = require("./modules/listingsDB.js");

dotenv.config();

const app = express();
const HTTP_PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize MongoDB connection
const db = new ListingsDB();

db.initialize(process.env.MONGODB_CONN_STRING)
  .then(() => {
    // Define routes after successful MongoDB connection
    app.get("/", (req, res) => {
      res.json({ message: "API Listening" });
    });

    // POST route to add a new listing
    app.post("/api/listings", async (req, res) => {
      try {
        const newListing = await db.addNewListing(req.body);
        res.status(201).json(newListing);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to add a new listing" });
      }
    });

    // GET route to fetch listings with optional filtering
    app.get("/api/listings", async (req, res) => {
      try {
        const { page, perPage, name } = req.query;
        const listings = await db.getAllListings(page, perPage, name);
        res.json(listings);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch listings" });
      }
    });

    // GET route to fetch a specific listing by ID
    app.get("/api/listings/:id", async (req, res) => {
      try {
        const listing = await db.getListingById(req.params.id);
        if (listing) {
          res.json(listing);
        } else {
          res.status(404).json({ message: "Listing not found" });
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch the listing" });
      }
    });

    // PUT route to update a specific listing by ID
    app.put("/api/listings/:id", async (req, res) => {
      try {
        const result = await db.updateListingById(req.body, req.params.id);
        if (result) {
          res.json({ message: "Listing updated successfully" });
        } else {
          res.status(404).json({ message: "Listing not found" });
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to update the listing" });
      }
    });

    // DELETE route to delete a specific listing by ID
    app.delete("/api/listings/:id", async (req, res) => {
      try {
        const result = await db.deleteListingById(req.params.id);
        if (result.deletedCount) {
          res.json({ message: "Listing deleted successfully" });
         } else {
          res.status(404).json({ message: "Listing not found" });
         }
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to delete the listing" });
      }
    });

    app.listen(HTTP_PORT, () => {
      console.log(`Server listening on: ${HTTP_PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
