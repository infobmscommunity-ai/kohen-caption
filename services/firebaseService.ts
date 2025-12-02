
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  updateDoc,
  doc, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "../firebase";
import { ProductCatalogItem, GeneratedCaptionData, ContentStrategy, MainBrain } from "../types";

// Menggunakan nama koleksi sesuai request user
const CATALOG_COLLECTION = "DATA PRODUK";
const CAPTION_COLLECTION = "generated_captions";
const STRATEGY_COLLECTION = "STRATEGI"; 
const MAIN_BRAIN_COLLECTION = "OTAK"; // Updated to "OTAK"

// --- Product Catalog Services (CRUD) ---

// CREATE
export const saveCatalogProduct = async (data: Omit<ProductCatalogItem, "id" | "createdAt">) => {
  try {
    const docRef = await addDoc(collection(db, CATALOG_COLLECTION), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error saving catalog item: ", error);
    throw error;
  }
};

// READ
export const getCatalogProducts = async (userId: string): Promise<ProductCatalogItem[]> => {
  try {
    const q = query(
      collection(db, CATALOG_COLLECTION),
      where("userId", "==", userId)
    );
    
    const querySnapshot = await getDocs(q);
    const products: ProductCatalogItem[] = [];
    
    querySnapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() } as ProductCatalogItem);
    });
    
    // Client-side sorting (Desc)
    return products.sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA;
    });
  } catch (error) {
    console.error("Error fetching catalog: ", error);
    return [];
  }
};

// UPDATE
export const updateCatalogProduct = async (id: string, data: Partial<ProductCatalogItem>) => {
  try {
    const docRef = doc(db, CATALOG_COLLECTION, id);
    const updateData = { ...data };
    delete updateData.id; 
    delete updateData.createdAt; 

    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error("Error updating catalog item: ", error);
    throw error;
  }
};

// DELETE
export const deleteCatalogProduct = async (id: string) => {
  try {
    await deleteDoc(doc(db, CATALOG_COLLECTION, id));
  } catch (error) {
    console.error("Error deleting catalog item: ", error);
    throw error;
  }
};

// --- Strategy Services (CRUD) ---

// CREATE
export const saveStrategy = async (data: Omit<ContentStrategy, "id" | "createdAt">) => {
  try {
    const docRef = await addDoc(collection(db, STRATEGY_COLLECTION), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error saving strategy: ", error);
    throw error;
  }
};

// READ
export const getStrategies = async (userId: string): Promise<ContentStrategy[]> => {
  try {
    const q = query(
      collection(db, STRATEGY_COLLECTION),
      where("userId", "==", userId)
    );
    
    const querySnapshot = await getDocs(q);
    const strategies: ContentStrategy[] = [];
    
    querySnapshot.forEach((doc) => {
      strategies.push({ id: doc.id, ...doc.data() } as ContentStrategy);
    });
    
    return strategies.sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA;
    });
  } catch (error) {
    console.error("Error fetching strategies: ", error);
    return [];
  }
};

// UPDATE
export const updateStrategy = async (id: string, data: Partial<ContentStrategy>) => {
  try {
    const docRef = doc(db, STRATEGY_COLLECTION, id);
    const updateData = { ...data };
    delete updateData.id;
    delete updateData.createdAt;

    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error("Error updating strategy: ", error);
    throw error;
  }
};

// DELETE
export const deleteStrategy = async (id: string) => {
  try {
    await deleteDoc(doc(db, STRATEGY_COLLECTION, id));
  } catch (error) {
    console.error("Error deleting strategy: ", error);
    throw error;
  }
};

// --- Main Brain Services (CRUD - OTAK) ---

// CREATE
export const saveMainBrain = async (data: Omit<MainBrain, "id" | "createdAt">) => {
  try {
    const docRef = await addDoc(collection(db, MAIN_BRAIN_COLLECTION), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error saving main brain: ", error);
    throw error;
  }
};

// READ
export const getMainBrains = async (userId: string): Promise<MainBrain[]> => {
  try {
    const q = query(
      collection(db, MAIN_BRAIN_COLLECTION),
      where("userId", "==", userId)
    );
    const querySnapshot = await getDocs(q);
    
    const brains: MainBrain[] = [];
    querySnapshot.forEach((doc) => {
      brains.push({ id: doc.id, ...doc.data() } as MainBrain);
    });

    return brains.sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA;
    });
  } catch (error) {
    console.error("Error fetching main brains: ", error);
    return [];
  }
};

// UPDATE
export const updateMainBrain = async (id: string, data: Partial<MainBrain>) => {
  try {
    const docRef = doc(db, MAIN_BRAIN_COLLECTION, id);
    const updateData = { ...data };
    delete updateData.id;
    delete updateData.createdAt;

    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error("Error updating main brain: ", error);
    throw error;
  }
};

// DELETE
export const deleteMainBrain = async (id: string) => {
  try {
    await deleteDoc(doc(db, MAIN_BRAIN_COLLECTION, id));
  } catch (error) {
    console.error("Error deleting main brain: ", error);
    throw error;
  }
};

// --- Generated Caption Services ---

export const saveGeneratedCaption = async (data: Omit<GeneratedCaptionData, "id" | "createdAt">) => {
  try {
    const docRef = await addDoc(collection(db, CAPTION_COLLECTION), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error saving caption: ", error);
    throw error;
  }
};

export const getGeneratedCaptions = async (userId: string): Promise<GeneratedCaptionData[]> => {
  try {
    const q = query(
      collection(db, CAPTION_COLLECTION),
      where("userId", "==", userId)
    );
    
    const querySnapshot = await getDocs(q);
    const captions: GeneratedCaptionData[] = [];
    
    querySnapshot.forEach((doc) => {
      captions.push({ id: doc.id, ...doc.data() } as GeneratedCaptionData);
    });
    
    // Client-side sorting (Desc)
    return captions.sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA;
    });
  } catch (error) {
    console.error("Error fetching captions: ", error);
    return [];
  }
};

export const deleteGeneratedCaption = async (id: string) => {
  try {
    await deleteDoc(doc(db, CAPTION_COLLECTION, id));
  } catch (error) {
    console.error("Error deleting caption: ", error);
    throw error;
  }
};