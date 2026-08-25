import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Home } from '@/pages/Home';
import { Raspadinhas } from '@/pages/Raspadinhas';
import { RaspadinhaDetalhe } from '@/pages/RaspadinhaDetalhe';
import { Premios } from '@/pages/Premios';
import { Pacotes } from '@/pages/Pacotes';
import { Login } from '@/pages/Login';
import { Cadastro } from '@/pages/Cadastro';
import { Carteira } from '@/pages/Carteira';
import { Perfil } from '@/pages/Perfil';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/raspadinhas" element={<Raspadinhas />} />
        <Route path="/raspadinha/:id" element={<RaspadinhaDetalhe />} />
        <Route path="/premios" element={<Premios />} />
        <Route path="/pacotes" element={<Pacotes />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/carteira" element={<Carteira />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
