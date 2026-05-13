import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontFamily: "Helvetica",
    backgroundColor: "#FAFAF8",
  },
  header: {
    textAlign: "center",
    marginBottom: 18,
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: "#555",
  },
  grid: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  card: {
    width: "47%",
    padding: 14,
    borderRadius: 10,
    border: "1pt solid #E5E5E0",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: "#333",
    marginBottom: 6,
  },
  qr: {
    width: 180,
    height: 180,
  },
  cardSub: {
    fontSize: 9,
    color: "#666",
    marginTop: 6,
    textAlign: "center",
  },
  url: {
    fontSize: 8,
    color: "#999",
    marginTop: 3,
  },
});

export type QrCardData = {
  qrDataUrl: string;
  label: string;
  url: string;
};

export function QrSheetDocument({
  eventTitle,
  weddingDate,
  cards,
}: {
  eventTitle: string;
  weddingDate: string;
  cards: QrCardData[];
}) {
  const perPage = 4;
  const pages: QrCardData[][] = [];
  for (let i = 0; i < cards.length; i += perPage) {
    pages.push(cards.slice(i, i + perPage));
  }

  return (
    <Document>
      {pages.map((pageCards, pageIdx) => (
        <Page key={pageIdx} size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.title}>{eventTitle}</Text>
            <Text style={styles.subtitle}>
              Свадьба {weddingDate} · Сосканируй и поделись фото
            </Text>
          </View>
          <View style={styles.grid}>
            {pageCards.map((c, i) => (
              <View key={i} style={styles.card}>
                <Text style={styles.cardTitle}>{c.label}</Text>
                <Image src={c.qrDataUrl} style={styles.qr} />
                <Text style={styles.cardSub}>Открой камеру и наведи на код</Text>
                <Text style={styles.url}>{c.url}</Text>
              </View>
            ))}
          </View>
        </Page>
      ))}
    </Document>
  );
}
