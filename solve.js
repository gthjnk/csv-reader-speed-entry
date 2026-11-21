export function run(input) {
  const text = String(input.text);
  const hasHeader = input.header === true;
  const rows = [];
  const errors = [];
  let columns = null;
  let width = -1;
  let pos = text.charCodeAt(0) === 0xfeff ? 1 : 0;
  let line = 1;
  const end = text.length;
  const quoteToken = /["\r\n]/g;
  const unquotedToken = /[,\r\n]/g;
  unquotedToken.lastIndex = pos;
  let delimiter = unquotedToken.exec(text);

  while (pos < end) {
    const recordLine = line;
    const row = hasHeader && columns === null ? null : rows.length;
    const fields = [];
    let sep;
    let quoted;

    do {
      quoted = text.charCodeAt(pos) === 34;
      let value = '';
      let closed = false;
      if (quoted) {
        let start = pos + 1;
        let lines = 0;
        quoteToken.lastIndex = start;
        for (let token; (token = quoteToken.exec(text)) !== null;) {
          const at = token.index;
          if (token[0] === '"') {
            if (text.charCodeAt(at + 1) === 34) {
              value += text.slice(start, at + 1);
              start = quoteToken.lastIndex = at + 2;
            } else {
              value += text.slice(start, at);
              pos = at + 1;
              line += lines;
              closed = true;
              break;
            }
          } else {
            lines++;
            if (token[0] === '\r') {
              value += text.slice(start, at) + '\n';
              start = quoteToken.lastIndex = at + (text.charCodeAt(at + 1) === 10 ? 2 : 1);
            }
          }
        }
        if (!closed) {
          errors.push({ code: 'unterminated_quote', line: recordLine, row });
          value = '';
        }
      }

      if (delimiter !== null && delimiter.index < pos) {
        unquotedToken.lastIndex = pos;
        delimiter = unquotedToken.exec(text);
      }
      let added = false;
      for (;;) {
        if (delimiter === null) {
          if (pos < end) {
            value += text.slice(pos);
            added = true;
          }
          pos = end;
          sep = '';
          break;
        }
        const at = delimiter.index;
        if (at > pos) {
          value += text.slice(pos, at);
          added = true;
        }
        sep = delimiter[0];
        pos = at + 1;
        if (sep === '\r') {
          if (text.charCodeAt(pos) === 10) {
            pos++;
            unquotedToken.lastIndex = pos;
          } else {
            errors.push({ code: 'stray_cr', line: recordLine, row });
            delimiter = unquotedToken.exec(text);
            continue;
          }
        }
        delimiter = unquotedToken.exec(text);
        if (sep !== ',') line++;
        break;
      }

      if (closed && added) errors.push({ code: 'quote_junk', line: recordLine, row });
      fields.push(value);
    } while (sep === ',');

    if (fields.length === 1 && fields[0] === '' && !quoted) continue;
    if (width < 0) width = fields.length;
    if (hasHeader && columns === null) {
      columns = fields;
      continue;
    }
    if (fields.length < width) {
      errors.push({ code: 'short_row', line: recordLine, row, fields: fields.length });
      while (fields.length < width) fields.push('');
    } else if (fields.length > width) {
      errors.push({ code: 'long_row', line: recordLine, row, extra: fields.splice(width) });
    }
    rows.push(fields);
  }
  return { columns: hasHeader ? (columns ?? []) : null, rows, errors };
}
