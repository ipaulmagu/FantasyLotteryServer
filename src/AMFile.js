const fs = require("fs");

module.exports = class File {
  static exists(fname) {
    return fs.existsSync(fname);
  }
  static delete(fname) {
    return fs.unlink(fname, err => {
      if (err) throw err;
      console.log(`${fname} was deleted`);
    });
  }
  static stat(fname) {
    return fs.statSync(fname);
  }
  static readFile(fname) {
    try {
      if (File.exists(fname)) return fs.readFileSync(fname, "utf8");
      else return null;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  /**
   * Return lines of text fields; Array of Arrays: i.e. [[f1,f2,f3,...], [f1,f2,f3,...], ...[]]
   * @param {*} fname
   * @param {*} delimeter
   */
  static readCSV(fname, delimeter = ",") {
    return File.readFile(fname)
      .split("\n")
      .map(aline => aline.split(delimeter));
  }

  static write(fname, data) {
    if (!fname || fname.length < 1) return -1;
    if (!data) return -2;
    // console.log("Saving:...\n", data.substr(0, 100));
    const _data = new Uint8Array(Buffer.from(data));
    // console.log("Saving(_Buffer):...\n", _data.substr(0, 100));
    let res = fs.writeFileSync(fname, _data, { encoding: "utf8", flag: "w" });
    // console.log("Saved res:");

    // fs.writeFile(fname, _data, err => {
    //   if (err) throw err;
    //   console.log(`${fname} been written!`);
    //   // console.log(`${fname} been written! ${data}`);
    // });
  }
  /**
   *
   * @param {*} fname
   * @param {*} lines | ["f1,f2,f3,...", "f1,f2,f3, ...", ... ]
   * @param {*} lineDel
   */
  static save(fname, lines, lineDel = "\n") {
    if (!fname || fname.length < 1) return -1;
    if (!lines || lines.length < 1) return -2;
    const dataLines = Array.isArray(lines) ? lines.join(lineDel) : lines;
    const data = new Uint8Array(Buffer.from(dataLines));
    // fs.writeFileSync(fname,data)
    fs.writeFile(fname, data, err => {
      if (err) throw err;
      console.log(`Success saving ${fname}!`);
    });
  }

  static savecsv(fname, lines) {
    return File.write(fname, lines.map(aline => aline.join(",")).join("\n"));
  }
};
