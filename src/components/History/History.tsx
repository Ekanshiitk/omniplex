"use client";

import React, { useEffect, useState, useCallback } from "react";
import styles from "./History.module.css";
import Image from "next/image";
import Auth from "../Auth/Auth";
import SpinnerWhite from "../SpinnerWhite/SpinnerWhite";
import { useRouter } from "next/navigation";
import { Skeleton } from "@nextui-org/skeleton";
import { useDisclosure } from "@nextui-org/modal";
import { ScrollShadow } from "@nextui-org/scroll-shadow";
import {
  formatTimestamp,
  getRelativeDateLabel,
  cutString,
} from "@/utils/utils";
import { ChatThread } from "@/utils/types";
import { useSelector } from "react-redux";
import { selectAuthState, selectUserDetailsState } from "../../store/authSlice";
import {
  collection,
  query,
  getDocs,
  orderBy,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import Pen from "../../../public/svgs/Pen.svg";
import Bin from "../../../public/svgs/Bin.svg";
import ChatInactive from "../../../public/svgs/sidebar/Chat_Inactive.svg";

interface ChatThreadWithTimestamp extends ChatThread {
  createdAt: Timestamp;
}

// ✅ Memoized fetchChatHistory to prevent unnecessary re-renders
const History = () => {
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isAuthenticated = useSelector(selectAuthState);
  const userDetails = useSelector(selectUserDetailsState);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatThreadWithTimestamp[]>([]);
  const [fadeIn, setFadeIn] = useState(false);

  // ✅ Memoized fetchChatHistory using useCallback to prevent infinite loops
  const fetchChatHistory = useCallback(async () => {
    if (!isAuthenticated || !userDetails?.uid) {
      setChatHistory([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const historyRef = collection(db, "users", userDetails.uid, "history");
      const q = query(historyRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      const history = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ChatThreadWithTimestamp[];

      setChatHistory(history);
    } catch (error) {
      console.error("Error fetching chat history:", error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, userDetails?.uid]);

  // ✅ useEffect runs only when necessary
  useEffect(() => {
    setFadeIn(true);
    fetchChatHistory();
  }, [fetchChatHistory]);

  // ✅ Delete function to remove chat history
  const handleDelete = async (threadId: string) => {
    if (!isAuthenticated || !userDetails?.uid) return;

    try {
      setDeleting(true);
      await deleteDoc(doc(db, "users", userDetails.uid, "history", threadId));
      fetchChatHistory(); // Refresh the history after deletion
    } catch (error) {
      console.error("Error deleting chat:", error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className={`${styles.list} transition-opacity duration-500 ${
        fadeIn ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className={styles.titleContainer}>
        <div className={styles.title}>Chats</div>
        <div className={styles.titleButton} onClick={() => router.push("/")}>
          <Image
            width={20}
            height={20}
            src={Pen}
            alt="New Chat"
            className={styles.titleButtonIcon}
          />
          <p className={styles.titleButtonText}>New Chat</p>
        </div>
      </div>

      <ScrollShadow hideScrollBar className="h-[calc(100vh_-_50px)] w-full">
        <div className={styles.listContainer}>
          {loading ? (
            [...Array(10)].map((_, i) => (
              <Skeleton key={i} className={styles.skeletonListItem} />
            ))
          ) : chatHistory.length === 0 ? (
            <div className={styles.emptyState}>
              <Image
                src={ChatInactive}
                alt="No Chats"
                className={styles.emptyStateIcon}
              />
              <p className={styles.emptyStateText}>No Chat History</p>
            </div>
          ) : (
            chatHistory.map((item, index, array) => {
              const formattedDate = formatTimestamp(item.createdAt);
              const header =
                index === 0 ||
                formattedDate !== formatTimestamp(array[index - 1].createdAt) ? (
                  <div key={`header-${index}`} className={styles.listHeader}>
                    {getRelativeDateLabel(formattedDate)}
                  </div>
                ) : null;

              return (
                <React.Fragment key={item.id}>
                  {header}
                  <div
                    className={styles.listItem}
                    onClick={() => router.push(`/chat/${item.id}`)}
                  >
                    {cutString(item.chats[0].question, 24)}
                    {deleting ? (
                      <div className={styles.spinner}>
                        <SpinnerWhite />
                      </div>
                    ) : (
                      <Image
                        src={Bin}
                        alt="Delete"
                        className={styles.bin}
                        onClick={(event) => {
                          event.stopPropagation(); // ✅ Prevents clicking on parent element
                          handleDelete(item.id);
                        }}
                      />
                    )}
                  </div>
                </React.Fragment>
              );
            })
          )}
        </div>
      </ScrollShadow>

      {!isAuthenticated && (
        <div className={styles.modalOverlay}>
          <div
            className={styles.button}
            onClick={() => router.push("/login")}
          >
            Sign In
          </div>
        </div>
      )}

      <Auth isOpen={isOpen} onClose={onClose} />
    </div>
  );
};

export default History;