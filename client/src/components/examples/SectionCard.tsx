import SectionCard from '../SectionCard'
import engineeringImage from '@assets/stock_images/modern_engineering_w_afeecc6f.jpg'

export default function SectionCardExample() {
  return (
    <div className="p-4">
      <SectionCard
        title="Ingeniería"
        description="Proyectos, código y documentos técnicos"
        imageSrc={engineeringImage}
        href="/ingenieria"
        category="ingenieria"
      />
    </div>
  )
}
