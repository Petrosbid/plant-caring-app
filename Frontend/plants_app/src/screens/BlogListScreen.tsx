import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FilterSortBar } from "../components/common/FilterSortBar";
import { FilterSortModal } from "../components/common/FilterSortModal";
import { Loader } from "../components/common/Loader";
import { ScreenWrapper } from "../components/common/ScreenWrapper";
import { BLOG_SORT_OPTIONS } from "../constants/filters";
import { blogService } from "../services/api";
import { RootStackParamList } from "../types/navigation";
import { formatDate } from "../utils/date";

const BlogListScreen = () => {
  const { t, i18n } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isEn = i18n.language === "en";

  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [ordering, setOrdering] = useState("-publish");
  const [modalType, setModalType] = useState<"filter" | "sort" | null>(null);

  const fetchPosts = async () => {
    try {
      if (!refreshing) setLoading(true);
      const data = await blogService.getPosts({
        search: search || undefined,
        ordering,
        category: selectedCategory === "All" ? undefined : selectedCategory,
      });
      const results = data.results || [];
      setPosts(results);

      const uniqueCats = new Set<string>();
      results.forEach((p: any) => {
        if (p.category) uniqueCats.add(p.category);
      });
      if (uniqueCats.size > 0) {
        setCategories(["All", ...Array.from(uniqueCats).sort()]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchPosts();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [search, ordering, selectedCategory]);

  const blogFilters = {
    category: {
      labelEn: "Category",
      labelFa: "دسته بندی",
      values: categories.map((cat) => ({
        en: cat,
        fa: cat === "All" ? "همه" : cat,
        query: cat,
      })),
    },
  };

  return (
    <ScreenWrapper withScroll={false}>
      <View className="px-2 pt-2 mb-6 mt-9">
        <Text className="text-3xl font-black text-slate-900 dark:text-white mb-2">
          {t("common.blog")}
        </Text>
        <Text className="text-slate-500 dark:text-slate-400 mb-6">
          {isEn
            ? "Learn how to care for your plants like a pro"
            : "یاد بگیرید چطور حرفه‌ای از گیاهانتان مراقبت کنید"}
        </Text>

        <FilterSortBar
          search={search}
          onSearchChange={setSearch}
          onFilterPress={() => setModalType("filter")}
          onSortPress={() => setModalType("sort")}
          activeFiltersCount={selectedCategory !== "All" ? 1 : 0}
        />
      </View>

      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <Loader size={16} />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 120 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchPosts();
              }}
              tintColor="#16a34a"
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("BlogDetail", { slug: item.slug })
              }
              className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden mb-6 shadow-sm border border-slate-100 dark:border-slate-700"
            >
              <Image
                source={{ uri: item.cover_image }}
                className="w-full h-48"
                resizeMode="cover"
              />
              <View className="p-5">
                <Text className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest mb-2">
                  {formatDate(item.publish, i18n.language)}
                </Text>
                <Text className="text-xl font-black text-slate-900 dark:text-white mb-2 leading-7">
                  {isEn && item.title_en ? item.title_en : item.title}
                </Text>
                <Text
                  className="text-slate-500 dark:text-slate-400 text-sm leading-5 mb-4"
                  numberOfLines={2}
                >
                  {isEn && item.excerpt_en ? item.excerpt_en : item.excerpt}
                </Text>
                <View className="flex-row items-center justify-between">
                  <Text className="text-brand-600 dark:text-brand-400 font-bold text-sm">
                    {isEn ? "Read Article" : "ادامه مطلب"}
                  </Text>
                  {isEn ? (
                    <ChevronRight size={18} color="#16a34a" />
                  ) : (
                    <ChevronLeft size={18} color="#16a34a" />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            !loading ? (
              <View className="items-center justify-center py-20">
                <Text className="text-slate-400">
                  {isEn ? "No articles found" : "مطلبی یافت نشد"}
                </Text>
              </View>
            ) : null
          }
        />
      )}

      <FilterSortModal
        isVisible={!!modalType}
        onClose={() => setModalType(null)}
        type={modalType || "sort"}
        sortOptions={BLOG_SORT_OPTIONS}
        currentSort={ordering}
        onSortChange={setOrdering}
        filterCategories={blogFilters as any}
        currentFilters={{ category: selectedCategory }}
        onFiltersApply={(filters) =>
          setSelectedCategory(filters.category ?? "All")
        }
      />
    </ScreenWrapper>
  );
};

export default BlogListScreen;
