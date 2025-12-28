import { forwardRef } from "react";
import { Text, View } from "react-native";

type ShareCardProps = {
  totalVolume: number;
  peakReps: number;
  setsCompleted: number;
  date: Date;
};

const ShareCard = forwardRef<View, ShareCardProps>(
  ({ totalVolume, peakReps, setsCompleted, date }, ref) => {
    const formattedDate = date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    const getRank = () => {
      if (totalVolume >= 200) {
        return { title: "HEAVYWEIGHT", stars: 5 };
      }
      if (totalVolume >= 150) {
        return { title: "CRUISERWEIGHT", stars: 4 };
      }
      if (totalVolume >= 100) {
        return { title: "MIDDLEWEIGHT", stars: 3 };
      }
      if (totalVolume >= 50) {
        return { title: "WELTERWEIGHT", stars: 2 };
      }
      return { title: "FEATHERWEIGHT", stars: 1 };
    };

    const rank = getRank();

    return (
      <View
        ref={ref}
        style={{
          position: "relative",
          width: 390,
          height: 520,
          backgroundColor: "#09090b",
          padding: 32,
          overflow: "hidden",
        }}
      >
        {/* Bottom-right lime glow */}
        <View
          style={{
            position: "absolute",
            bottom: -85,
            right: -85,
            width: 256,
            height: 256,
            borderRadius: 128,
            backgroundColor: "rgba(132, 204, 22, 0.1)",
          }}
        />

        {/* Header */}
        <View style={{ alignItems: "center", marginTop: 16, zIndex: 10 }}>
          <Text
            style={{
              fontSize: 12,
              fontWeight: "500",
              color: "#71717a",
              textTransform: "uppercase",
              letterSpacing: 2,
            }}
          >
            {formattedDate}
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginTop: 8,
            }}
          >
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: "#84cc16",
              }}
            />
            <Text
              style={{
                fontSize: 24,
                fontWeight: "700",
                color: "#ffffff",
                letterSpacing: -0.5,
              }}
            >
              PYRAMID PUSH
            </Text>
          </View>
        </View>

        {/* Center Stats */}
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: "500",
              color: "#71717a",
              textTransform: "uppercase",
              letterSpacing: 1,
              marginBottom: 8,
            }}
          >
            Total Volume
          </Text>
          <Text
            style={{
              fontSize: 128,
              fontWeight: "900",
              color: "#ffffff",
              lineHeight: 128,
              letterSpacing: -4,
            }}
          >
            {totalVolume}
          </Text>

          {/* Stars */}
          <View
            style={{
              flexDirection: "row",
              gap: 6,
              marginTop: 24,
            }}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <Text
                key={`star-${star}`}
                style={{
                  fontSize: 24,
                  color: star <= rank.stars ? "#84cc16" : "#27272a",
                }}
              >
                ★
              </Text>
            ))}
          </View>

          {/* Rank Badge */}
          <View
            style={{
              marginTop: 12,
              paddingHorizontal: 20,
              paddingVertical: 8,
              borderRadius: 9999,
              borderWidth: 1,
              borderColor: "#27272a",
              backgroundColor: "#18181b",
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "700",
                color: "#d4d4d8",
                textTransform: "uppercase",
                letterSpacing: 2,
              }}
            >
              {rank.title}
            </Text>
          </View>
        </View>

        {/* Footer Stats */}
        <View
          style={{
            flexDirection: "row",
            gap: 16,
            marginBottom: 16,
            zIndex: 10,
          }}
        >
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: "#27272a",
              backgroundColor: "rgba(24, 24, 27, 0.8)",
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: "700",
                color: "#71717a",
                textTransform: "uppercase",
                letterSpacing: 2,
                marginBottom: 4,
              }}
            >
              Peak Reps
            </Text>
            <Text style={{ fontSize: 30, fontWeight: "700", color: "#ffffff" }}>
              {peakReps}
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: "#27272a",
              backgroundColor: "rgba(24, 24, 27, 0.8)",
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: "700",
                color: "#71717a",
                textTransform: "uppercase",
                letterSpacing: 2,
                marginBottom: 4,
              }}
            >
              Sets Done
            </Text>
            <Text style={{ fontSize: 30, fontWeight: "700", color: "#ffffff" }}>
              {setsCompleted}
            </Text>
          </View>
        </View>
      </View>
    );
  }
);

ShareCard.displayName = "ShareCard";

export default ShareCard;
