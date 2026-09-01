export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{
        // Emit the six-character sequence <, not the '<' character: writing
        // '<' here is just '<' again, which would let a "</script>" inside
        // the data close this tag. JSON readers decode the escape back to '<'.
        __html: JSON.stringify(data).replace(/</gu, '\\u003c'),
      }}
    />
  );
}
