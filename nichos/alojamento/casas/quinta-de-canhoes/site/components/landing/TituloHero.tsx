import styles from "./Hero.module.css";

export function TituloHero() {
  return (
    <>
      <span className={styles.lineMask}><span className={styles.line}>Acorde com o</span></span>
      <span className={styles.lineMask}><span className={`${styles.line} italic font-black pr-2`}>vale à janela</span></span>
    </>
  );
}
