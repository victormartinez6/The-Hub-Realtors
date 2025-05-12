export interface Post {
  id: string;
  author: {
    id: string;
    name: string;
    role: string;
    avatar: string;
  };
  caption: string;
  mediaFiles: {
    url: string;
    type: string;
    path?: string;
  }[];
  likes: number;
  likedBy: string[];
  comments: any[];
  createdAt: any;
  newComment?: string;
  currentMediaIndex?: number;
  
  // Campos adicionais para o perfil do usuário
  bio?: string;
  followers?: number;
  following?: number;
  posts?: number;
  propertiesSold?: number;
  clientsCount?: number;
}

export interface ExtendedPost extends Post {
  currentMediaIndex: number;
  newComment: string;
}
