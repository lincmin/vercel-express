const OSS = require("ali-oss");
const multer = require("multer");
const express = require("express");
const app = express();
const fs = require("fs");
const dayjs = require("dayjs");

const upload = multer({ dest: "./tmp/" }); // 文件暂存本地目录
require("dotenv").config();

const ossClient = new OSS({
  region: process.env.region, // OSS 区域，例如 'oss-cn-hangzhou'
  accessKeyId: process.env.accessKeyId, // 阿里云 AccessKey ID
  accessKeySecret: process.env.accessKeySecret, // 阿里云 AccessKey Secret
  bucket: process.env.bucket, // OSS bucket 名称
});
app.get("/", (req, res) => res.send("Hello Express!"));
app.post("/upload", upload.single("file"), async (req, res) => {
  const file = req.file; // 获取上传的文件
  const cusName = req.body.cusName;
  console.log("cusName", cusName);
  if (!file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const fileName = `${Date.now()}-${file.originalname}`;
  let mdTextName;
  if (cusName === "") {
    mdTextName = `${file.originalname}`;
  } else {
    mdTextName = cusName;
  }
  // 获取当前日期
  const now = dayjs();
  const year = now.year();
  const date = now.format("YYYY-MM-DD");
  try {
    const result = await ossClient.put(
      `shortcut/${year}/${date}/${fileName}`, // OSS中的文件路径
      file.path // 本地文件路径
    );
    fs.unlinkSync(file.path);
    res.json({
      url: result.url, // 返回文件的访问URL
      mdName: `![${mdTextName}](${result.url})`,
      status: "上传成功",
    });
  } catch (err) {
    res.status(500).json({ error: "上传失败", details: err });
  }
});

app.listen(3000, () => console.log("Server ready on port 3000."));

module.exports = app;
