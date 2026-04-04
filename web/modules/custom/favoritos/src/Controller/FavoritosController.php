<?php

namespace Drupal\favoritos\Controller;

use Symfony\Component\HttpFoundation\JsonResponse;
use Drupal\node\Entity\Node;

class FavoritosController {

  public function toggle($node) {

    $node = Node::load($node);

    if (!$node) {
      return new JsonResponse(['error' => 'Nodo no encontrado'], 404);
    }

    return new JsonResponse([
      'estado' => 'ok',
      'node' => $node->id(),
    ]);
  }

}
