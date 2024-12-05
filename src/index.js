import express from "express";
import cors from "cors";
import multer from "multer";
import archiver from "archiver";

import User from "./User.model.js";
import Package from "./Package.model.js";
import { connectDatabase } from "./dbconfig.js";
import { syncModels } from "./associations.js";
import Artifact from "./Artifact.model.js";

const app = express();
const storage = multer.memoryStorage();

async function setUpDatabase() {
  await connectDatabase();
  await syncModels();
}

// set up the database
setUpDatabase()
  .then(() => {
    console.log("Database setup complete");
  })
  .catch((error) => {
    console.error("Error setting up the database:", error);
  });

// multer middleware
const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB
  },
}).single("file");

app.use(express.json());
app.use(cors());

// create user
app.post("/api/user", (req, res) => {
  const { name, email } = req.body;
  try {
    User.create({ name, email }).then((user) => {
      res.json(user);
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// create package
app.post("/api/package", (req, res) => {
  const { name, createdBy } = req.body;
  try {
    Package.create({ name, createdBy }).then((pkg) => {
      res.json(pkg);
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// upload artifact for a package
app.post(
  "/api/package/:id/artifacts",
  (req, res, next) => {
    upload(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  async (req, res) => {
    const { id } = req.params;
    const { name, createdBy } = req.body;
    const { file } = req;
    try {
      const pkg = await Package.findByPk(id);
      if (!pkg) {
        return res.status(404).json({ error: "Package not found" });
      }
      const artifact = {
        name,
        attachment: file.buffer,
        createdBy,
        packageId: id,
      };
      const art = await Artifact.create(artifact);
      res.json(art);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
);

// download bulk artifacts for a package
app.get("/api/package/:id/artifacts/bulk", async (req, res) => {
  const { id } = req.params;
  try {
    const pkg = await Package.findByPk(id, {
      include: Artifact.unscoped(),
    });

    if (!pkg) {
      return res.status(404).json({ error: "Package not found" });
    }

    const zip = archiver("zip", { zlib: { level: 9 } });
    res.attachment(`${pkg.name}.zip`);
    zip.pipe(res);

    pkg.Artifacts.forEach((artifact) => {
      zip.append(artifact.attachment, { name: artifact.name });
    });

    await zip.finalize();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// download artifact for a package
app.get("/api/package/:id/artifacts/:artifactId", async (req, res) => {
  const { id, artifactId } = req.params;
  try {
    const artifact = await Artifact.unscoped().findByPk(artifactId, {
      where: { packageId: id },
    });
    if (!artifact) {
      return res.status(404).json({ error: "Artifact not found" });
    }
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${artifact.name}`,
    );
    res.send(artifact.attachment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// server listening
app.listen(3000, () => console.log("server started on 3000"));
