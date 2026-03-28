"use client";

import { useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  User,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

// 🔥 CONFIG FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyArUmB-cVVfgPhOjOHcVCHN-XoKTLhUtkc",
  authDomain: "transporcrediflex.firebaseapp.com",
  projectId: "transporcrediflex",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export default function Home() {
  const [email, setEmail] = useState<string>("");
  const [pass, setPass] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);

  const [monto, setMonto] = useState<string>("");
  const [entrada, setEntrada] = useState<string>("0");
  const [plazo, setPlazo] = useState<string>("");

  const [cuota, setCuota] = useState<string | null>(null);
  const [historial, setHistorial] = useState<any[]>([]);

  // 🔐 LOGIN O REGISTRO
  const login = async () => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      setUser(res.user);
      cargarHistorial(res.user.email || "");
    } catch {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      setUser(res.user);
    }
  };

  // 🧮 CALCULAR CUOTA CON 16.77%
  const calcular = () => {
    const tasaFija = 16.77;
    const financiado = Number(monto) - Number(entrada);
    const t = tasaFija / 100 / 12;

    const c =
      financiado *
        (t * Math.pow(1 + t, Number(plazo))) /
        (Math.pow(1 + t, Number(plazo)) - 1) +
      1.91;

    setCuota(c.toFixed(2));
  };

  // 💾 GUARDAR EN FIRESTORE
  const guardar = async () => {
    if (!user) return;

    await addDoc(collection(db, "creditos"), {
      email: user.email,
      monto,
      entrada,
      plazo,
      cuota,
      fecha: new Date(),
    });

    cargarHistorial(user.email || "");
  };

  // 📜 CARGAR HISTORIAL
  const cargarHistorial = async (emailUser: string) => {
    const q = query(
      collection(db, "creditos"),
      where("email", "==", emailUser)
    );

    const querySnapshot = await getDocs(q);
    let datos: any[] = [];
    querySnapshot.forEach((doc) => datos.push(doc.data()));
    setHistorial(datos);
  };

  // 🔐 PANTALLA LOGIN
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-xl w-80">
          <h2 className="text-2xl font-bold text-center mb-6 text-blue-700">
            TransporCrediflex
          </h2>

          <input
            className="w-full border p-2 mb-3 rounded"
            placeholder="Correo"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="w-full border p-2 mb-4 rounded"
            type="password"
            placeholder="Contraseña"
            onChange={(e) => setPass(e.target.value)}
          />

          <button
            className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800"
            onClick={login}
          >
            Ingresar
          </button>
        </div>
      </div>
    );
  }

  // 🧾 PANTALLA SISTEMA
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow">
        <h1 className="text-xl font-bold mb-4 text-blue-700">
          Sistema de Crédito TransporCrediflex
        </h1>

        <div className="grid gap-3">
          <input
            className="border p-2 rounded"
            placeholder="Monto del producto"
            onChange={(e) => setMonto(e.target.value)}
          />

          <input
            className="border p-2 rounded"
            placeholder="Entrada"
            onChange={(e) => setEntrada(e.target.value)}
          />

          <input
            className="border p-2 rounded"
            placeholder="Plazo en meses"
            onChange={(e) => setPlazo(e.target.value)}
          />
        </div>

        <div className="flex gap-3 mt-4">
          <button
            className="bg-blue-700 text-white px-4 py-2 rounded"
            onClick={calcular}
          >
            Calcular
          </button>

          <button
            className="bg-green-600 text-white px-4 py-2 rounded"
            onClick={guardar}
          >
            Guardar
          </button>
        </div>

        {cuota && (
          <h2 className="mt-4 text-lg font-semibold">
            Cuota mensual: ${cuota}
          </h2>
        )}

        <h3 className="mt-6 font-bold">Historial</h3>
        {historial.map((h, i) => (
          <div key={i} className="border p-2 rounded mt-2 text-sm">
            Monto: {h.monto} | Entrada: {h.entrada} | Plazo: {h.plazo} meses |
            Cuota: ${h.cuota}
          </div>
        ))}
      </div>
    </div>
  );
}
