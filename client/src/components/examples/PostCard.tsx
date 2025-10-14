import PostCard from '../PostCard'
import engineeringImage from '@assets/stock_images/modern_engineering_w_afeecc6f.jpg'

export default function PostCardExample() {
  return (
    <div className="p-4 max-w-sm">
      <PostCard
        id="1"
        title="Sistema de Control IoT con Arduino"
        excerpt="Desarrollo de un sistema de monitoreo y control para dispositivos IoT usando Arduino y sensores de temperatura."
        category="Ingeniería"
        date="14 Oct 2025"
        imageUrl={engineeringImage}
        tags={["IoT", "Arduino", "C++"]}
      />
    </div>
  )
}
