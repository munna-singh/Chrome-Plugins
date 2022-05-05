class DataReaderFactory {
  constructor(type, props) {
    if (type === "gs") return new GooglesheetReader(props);
  }
}
