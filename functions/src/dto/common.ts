export type TFirestoreData<T> = {
  data: T;
  ref: FirebaseFirestore.DocumentReference<
    FirebaseFirestore.DocumentData,
    FirebaseFirestore.DocumentData
  >;
  snapshot?: FirebaseFirestore.DocumentSnapshot<
    FirebaseFirestore.DocumentData,
    FirebaseFirestore.DocumentData
  >;
};
