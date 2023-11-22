import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { Dimensions } from "react-native";
import { Text } from "react-native-paper";
import { LineChart } from "react-native-chart-kit";
import { LinearGradient } from "expo-linear-gradient";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { LineChartData } from "react-native-chart-kit/dist/line-chart/LineChart";

import { IHomeScreenProps } from "./IHomeScreenProps";
import { HomeScreenStyle } from "./HomeScreen.style";
import { ICategory, ITransaction } from "../../common/interfaces";
import Category from "./components/category/Category";
import { TransactionItem } from "../../components/transaction-item";
import { getTransactions } from "../../services/TransactionsService";
import { loadGraphData } from "../../common/utils/loadGraphData";
import { loadTopSpending } from "../../common/utils/loadTopSpending";
import { getUserCategories } from "../../services/CategoryService";

const screenWidth = Dimensions.get("window").width + 50;
const chartConfig = {
  backgroundGradientFrom: "#6C47F8",
  backgroundGradientFromOpacity: 1,
  backgroundGradientTo: "#9141FC",
  backgroundGradientToOpacity: 1,
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.5,
  useShadowColorFromDataset: false,
};

export default function HomeScreen(_props: IHomeScreenProps) {
  const [displayName, setDisplayName] = useState("");
  const [latestExpenses, setLatestExpenses] = useState<ITransaction[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [graphData, setGraphData] = useState<LineChartData>();
  const [topSpending, setTopSpending] = useState<ICategory[]>([]);

  const auth = getAuth();
  onAuthStateChanged(auth, (user) => {
    if (user) {
      setDisplayName(user.displayName || "");
    } else {
      setDisplayName("");
    }
  });

  useEffect(() => {
    const currentDate = new Date();
    const dateSevenDaysAgo = new Date();
    dateSevenDaysAgo.setDate(currentDate.getDate() - 7);

    const loadExpenses = async () => {
      const expenses = await getTransactions(currentDate, dateSevenDaysAgo);
      if (!expenses) {
        setLatestExpenses([]);
      } else {
        setLatestExpenses(
          expenses.sort((a, b) => b.date.getTime() - a.date.getTime()),
        );
      }
    };

    loadExpenses();
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      const categories = await getUserCategories();
      if (!categories) {
        return;
      }
      setCategories(categories);
    };

    loadCategories();
  }, []);

  useEffect(() => {
    if (!latestExpenses || !categories) return;

    setGraphData(loadGraphData(latestExpenses));
    setTopSpending(loadTopSpending(latestExpenses, categories));
  }, [latestExpenses, categories]);

  return (
    <View style={HomeScreenStyle.container}>
      <ScrollView contentContainerStyle={HomeScreenStyle.wrapper}>
        <LinearGradient
          colors={["#6C47F8", "#9141FC"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={HomeScreenStyle.budgetHeader}
        >
          <Text style={HomeScreenStyle.budgetText} variant="displayMedium">
            50 PLN
          </Text>
          <Text style={HomeScreenStyle.budgetText} variant="titleLarge">
            For today
          </Text>
        </LinearGradient>
        {graphData && (
          <LineChart
            data={graphData}
            width={screenWidth}
            height={220}
            chartConfig={chartConfig}
            bezier
            withInnerLines={false}
            withOuterLines={false}
            // @ts-ignore
            style={HomeScreenStyle.lineChartStyle}
            formatYLabel={() => ""}
          />
        )}
        <View style={HomeScreenStyle.title}>
          <Text
            style={{
              ...HomeScreenStyle.titleText,
              ...HomeScreenStyle.textColor,
            }}
            variant="headlineSmall"
          >
            Welcome, {displayName}
          </Text>
        </View>
        <View style={HomeScreenStyle.section}>
          <Text
            style={{
              ...HomeScreenStyle.sectionText,
              ...HomeScreenStyle.textColor,
            }}
            variant="titleMedium"
          >
            Top spending from 7 days
          </Text>
          <ScrollView
            horizontal={true}
            contentContainerStyle={{ columnGap: 10 }}
          >
            {topSpending.map((category) => (
              <Category key={category.id} category={category} />
            ))}
          </ScrollView>
        </View>
        <View style={HomeScreenStyle.section}>
          <Text
            style={{
              ...HomeScreenStyle.sectionText,
              ...HomeScreenStyle.textColor,
            }}
            variant="titleMedium"
          >
            Latest from 7 days
          </Text>
          {latestExpenses.map((expense, key) => (
            <TransactionItem
              key={key}
              transaction={expense}
              categories={categories}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
