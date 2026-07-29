import { saveRoomData } from "../util/redis-cache.js";

export const savePlayerCategorySelections = async ({
  roomId,
  playerId,
  selectedCategoryIds,
  roomData,
  maximumCategorySelections,
}) => {
  const blueData = roomData.blue;

  blueData.playerCategorySelections ??= {};

  blueData.playerCategorySelections[playerId] = selectedCategoryIds;

  await saveRoomData(roomId, roomData);

  return {
    playerId,
    selectedCategoryIds,
  };
};

export const setMostSelectedCategories = async ({ roomId, roomData }) => {
  const blueData = roomData.blue;

  const categorySelectionCounts = new Map();

  Object.values(blueData.playerCategorySelections).forEach(
    (selectedCategoryIds) => {
      selectedCategoryIds.forEach((categoryId) => {
        categorySelectionCounts.set(
          categoryId,
          (categorySelectionCounts.get(categoryId) ?? 0) + 1,
        );
      });
    },
  );

  const rankedCategories = [...categorySelectionCounts.entries()]
    .map(([categoryId, selectionCount]) => ({
      categoryId,
      selectionCount,
    }))
    .sort(
      (firstCategory, secondCategory) =>
        secondCategory.selectionCount - firstCategory.selectionCount,
    );

  blueData.selectedCategories = rankedCategories;

  await saveRoomData(roomId, roomData);

  return {
    categoryBank: rankedCategories,
  };
};
