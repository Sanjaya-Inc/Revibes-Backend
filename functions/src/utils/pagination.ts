import { COLLECTION_MAP } from "./../constant/db";
import {
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  Firestore,
  Query,
} from "firebase-admin/firestore";
import { db } from "./firebase";
import AppError from "./formatter/AppError";
import { TPagination } from "../dto/pagination";

export type TPaginateConstruct<T> = TPagination & {
  ref?: DocumentReference<DocumentData, DocumentData>;
  addQuery?: (
    query: Query<DocumentData, DocumentData>,
  ) => Query<DocumentData, DocumentData>;
  construct?: new (...args: any[]) => T;
};

export type TPaginatedPage<T> = {
  items: T[];
  pagination: TPagination & {
    hasMoreNext: boolean;
    hasMorePrev: boolean;
  };
};

function getDocSnapshot(
  base: DocumentReference<DocumentData, DocumentData> | Firestore,
  collection: COLLECTION_MAP,
  docId?: string,
) {
  if (!docId) return null;
  return base.collection(collection).doc(docId).get();
}

async function checkHasMorePrev<T>(
  base: DocumentReference<DocumentData, DocumentData> | Firestore,
  collection: COLLECTION_MAP,
  sortBy: string,
  sortOrder: "asc" | "desc",
  addQuery: TPaginateConstruct<T>["addQuery"],
  docId: string,
) {
  const checkPrevDocSnapshot = await base
    .collection(collection)
    .doc(docId)
    .get();
  let veryPrevQuery = base.collection(collection).orderBy(sortBy, sortOrder);
  if (addQuery) {
    veryPrevQuery = addQuery(veryPrevQuery);
  }
  veryPrevQuery = veryPrevQuery.endBefore(checkPrevDocSnapshot).limit(1);
  const veryPrevSnapshot = await veryPrevQuery.get();
  return !veryPrevSnapshot.empty;
}

async function checkHasMorePrevInitial(
  base: DocumentReference<DocumentData, DocumentData> | Firestore,
  collection: COLLECTION_MAP,
  sortBy: string,
  sortOrder: "asc" | "desc",
  docId: string,
) {
  const checkFirstDocSnapshot = await base
    .collection(collection)
    .doc(docId)
    .get();
  const checkStartQuery = base
    .collection(collection)
    // .orderBy(sortBy, sortOrder)
    .endBefore(checkFirstDocSnapshot)
    .limit(1);
  const checkStartSnapshot = await checkStartQuery.get();
  return !checkStartSnapshot.empty;
}

export const createPage = async <T extends { id: string } = { id: string }>(
  collection: COLLECTION_MAP,
  {
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "asc",
    firstDocId,
    lastDocId,
    direction = "next",
    addQuery,
    ref,
    construct,
  }: TPaginateConstruct<T>,
): Promise<TPaginatedPage<T>> => {
  const base = ref ?? db;
  let firestoreQuery: Query<DocumentData> = base.collection(collection);

  if (addQuery) {
    firestoreQuery = addQuery(firestoreQuery);
  }

  firestoreQuery = firestoreQuery.orderBy(sortBy, sortOrder);

  let lastDocSnapshot: DocumentSnapshot | null = null;
  if (lastDocId) {
    lastDocSnapshot = await getDocSnapshot(base, collection, lastDocId);
    if (!lastDocSnapshot || !lastDocSnapshot.exists) {
      throw new AppError(404, "COMMON.CURSOR_DOC_NOT_FOUND");
    }
  }

  let firstDocSnapshot: DocumentSnapshot | null = null;
  if (firstDocId) {
    firstDocSnapshot = await getDocSnapshot(base, collection, firstDocId);
    if (!firstDocSnapshot || !firstDocSnapshot.exists) {
      throw new AppError(404, "COMMON.CURSOR_DOC_NOT_FOUND");
    }
  }

  if (direction === "next" && lastDocSnapshot) {
    firestoreQuery = firestoreQuery.startAfter(lastDocSnapshot);
  } else if (direction === "prev" && firstDocSnapshot) {
    firestoreQuery = base
      .collection(collection)
      .orderBy(sortBy, sortOrder === "asc" ? "desc" : "asc");

    if (addQuery) {
      firestoreQuery = addQuery(firestoreQuery);
    }
    firestoreQuery = firestoreQuery.startAfter(firstDocSnapshot);
  }

  const limitForFirestore = limit + 1;
  firestoreQuery = firestoreQuery.limit(limitForFirestore);

  const snapshot = await firestoreQuery.get();

  const items: T[] = [];
  snapshot.forEach((doc) => {
    items.push(
      construct
        ? new construct({ id: doc.id, ...doc.data() })
        : ({ id: doc.id, ...doc.data() } as T),
    );
  });

  let hasMoreNext = false;
  let hasMorePrev = false;

  if (items.length > limit) {
    hasMoreNext = true;
    items.pop();
  }

  if (direction === "prev" && firstDocId) {
    items.reverse();
    if (items.length > 0) {
      hasMorePrev = await checkHasMorePrev(
        base,
        collection,
        sortBy,
        sortOrder,
        addQuery,
        items[0].id,
      );
    }
  } else if (items.length > 0) {
    hasMorePrev = await checkHasMorePrevInitial(
      base,
      collection,
      sortBy,
      sortOrder,
      items[0].id,
    );
  }

  const newLastDocId =
    items.length > 0 ? items[items.length - 1].id : undefined;
  const newFirstDocId = items.length > 0 ? items[0].id : undefined;

  return {
    items,
    pagination: {
      limit,
      sortBy,
      sortOrder,
      lastDocId: newLastDocId,
      firstDocId: newFirstDocId,
      direction,
      hasMoreNext,
      hasMorePrev,
    },
  };
};
